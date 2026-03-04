/**
 * Face Swap API Integration
 * Server-side helpers for submitting images and polling status.
 *
 * Supports 1–5 images per request (JSON body or multipart).
 */

const FACE_SWAP_BASE_URL = 'https://api.darzh.xyz/api/method/new_face.api.face_swap';

function getToken(): string {
  const token = process.env.FACE_SWAP_TOKEN;
  if (!token) {
    throw new Error(
      '[faceswap] FACE_SWAP_TOKEN environment variable is not set. ' +
      'Add it to your .env.local file.'
    );
  }
  return token;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FaceSwapSubmitResponse {
  request_id: string;
  status: 'Queued';
}

export interface FaceSwapStatusResponse {
  request_id: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
  /** Raw base64 string (no data URL prefix) — present when status = Completed */
  image_b64?: string;
  /** data:image/png;base64,… string ready for <img src> — present when status = Completed */
  image_data_url?: string;
  /** Human-readable error — present when status = Failed */
  error_message?: string;
}

export interface FaceSwapSubmitOptions {
  /** Customer full name (optional) */
  customerName?: string;
  /** Customer email (optional) */
  customerEmail?: string;
  /**
   * URL the backend will POST the completed result to.
   * Use this for push-style notifications instead of polling.
   */
  callbackUrl?: string;
  /**
   * Exact name of a Prompt Template configured in the backend.
   * Falls back to the backend default when omitted.
   */
  promptTemplate?: string;
}

// ---------------------------------------------------------------------------
// Submit (JSON body — recommended)
// ---------------------------------------------------------------------------

/**
 * Submit one or more images to the Face Swap API.
 *
 * @param images  Single base64 string OR array of base64 strings (1–5, no data URL prefix).
 * @param userId  Shopify session ID or UUID.
 * @param opts    Optional metadata / routing fields.
 */
export async function submitFaceSwap(
  images: string | string[],
  userId: string,
  opts: FaceSwapSubmitOptions = {}
): Promise<FaceSwapSubmitResponse> {
  const token = getToken();
  const imageArray = Array.isArray(images) ? images : [images];

  if (imageArray.length === 0 || imageArray.length > 5) {
    throw new Error(`[faceswap] images must be 1–5 items, got ${imageArray.length}`);
  }

  // Use singular `image` key for backward compatibility with single-image requests
  const imagePayload =
    imageArray.length === 1
      ? { image: imageArray[0] }
      : { images: imageArray };

  const body: Record<string, unknown> = {
    ...imagePayload,
    user_id: userId,
    customer_name: opts.customerName ?? '',
    customer_email: opts.customerEmail ?? '',
  };

  if (opts.callbackUrl) body.callback_url = opts.callbackUrl;
  if (opts.promptTemplate) body.prompt_template = opts.promptTemplate;

  const response = await fetch(`${FACE_SWAP_BASE_URL}.process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Face-Swap-Token': token,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[faceswap] Process API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.message as FaceSwapSubmitResponse;
}

// ---------------------------------------------------------------------------
// Submit (multipart/form-data)
// ---------------------------------------------------------------------------

/**
 * Submit images as a multipart form upload.
 * Use when you already have File/Blob objects and want to skip base64 encoding.
 *
 * IMPORTANT: Do NOT set Content-Type manually — the runtime sets it with the boundary.
 *
 * @param files   Array of File / Blob objects (1–5).
 * @param userId  Shopify session ID or UUID.
 * @param opts    Optional metadata / routing fields.
 */
export async function submitFaceSwapMultipart(
  files: File[] | Blob[],
  userId: string,
  opts: FaceSwapSubmitOptions = {}
): Promise<FaceSwapSubmitResponse> {
  const token = getToken();

  if (files.length === 0 || files.length > 5) {
    throw new Error(`[faceswap] files must be 1–5 items, got ${files.length}`);
  }

  const formData = new FormData();
  formData.append('user_id', userId);
  if (opts.customerName) formData.append('customer_name', opts.customerName);
  if (opts.customerEmail) formData.append('customer_email', opts.customerEmail);
  if (opts.callbackUrl) formData.append('callback_url', opts.callbackUrl);
  if (opts.promptTemplate) formData.append('prompt_template', opts.promptTemplate);

  for (const file of files) {
    // Repeated same field name is correct per the API spec
    formData.append('images', file);
  }

  const response = await fetch(`${FACE_SWAP_BASE_URL}.process`, {
    method: 'POST',
    // Do NOT set Content-Type — fetch sets multipart/form-data + boundary automatically
    headers: {
      'X-Face-Swap-Token': token,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[faceswap] Multipart process API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.message as FaceSwapSubmitResponse;
}

// ---------------------------------------------------------------------------
// Poll status
// ---------------------------------------------------------------------------

/**
 * Poll the Face Swap API for processing status.
 * @param requestId  The request_id returned from submitFaceSwap / submitFaceSwapMultipart.
 */
export async function getFaceSwapStatus(
  requestId: string
): Promise<FaceSwapStatusResponse> {
  const token = getToken();

  const response = await fetch(`${FACE_SWAP_BASE_URL}.get_status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Face-Swap-Token': token,
    },
    body: JSON.stringify({ request_id: requestId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[faceswap] Status API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.message as FaceSwapStatusResponse;
}
