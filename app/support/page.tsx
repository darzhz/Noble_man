import Header from '@/components/header/Header';
import { UploadProvider } from '@/lib/uploadContext';
import { Mail, MessageSquare } from 'lucide-react';

export default function SupportPage() {
  return (
    <UploadProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">At Your Service, Your Majesty</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Our royal advisors await your correspondence.
          </p>

          <div className="flex justify-center mt-12 mb-16 max-w-3xl mx-auto">
            {/* Email Support */}
            <div className="p-6 rounded-2xl border border-border bg-card flex flex-col items-center text-center max-w-sm w-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-grow">
                For order inquiries, custom requests, and general questions.
                <br />
                We aim to respond within 24 hours.
              </p>
              <a href="mailto:admin@nobilified.com" className="text-primary font-medium hover:underline text-sm">
                admin@nobilified.com
              </a>
            </div>

          </div>

          <div className="max-w-2xl mx-auto bg-muted/30 p-8 rounded-2xl border border-border text-left">
            <h3 className="font-serif text-2xl font-bold mb-6 text-center">Send us a Message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <input type="text" id="name" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" placeholder="Lord Archibald" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input type="email" id="email" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" placeholder="archibald@estate.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <input type="text" id="subject" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" placeholder="Regarding my recent portrait..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea id="message" rows={4} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none" placeholder="How may we assist you today?"></textarea>
              </div>
              <button type="button" className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </main>
      </div>
    </UploadProvider>
  );
}
