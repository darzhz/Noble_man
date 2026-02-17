import Link from 'next/link';
import { Mail, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Noblified</h3>
            <p className="text-sm text-muted-foreground">
              AI-generated masterpieces celebrating Nobel excellence and human achievement.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  All Paintings
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  By Category
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Limited Editions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border py-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2024 Noblified. All rights reserved. | Crafted with AI
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail size={20} />
            </Link>
            <Link href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Twitter size={20} />
            </Link>
          </div>

          {/* Legal */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
