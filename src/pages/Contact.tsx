import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/layout/CartSidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      <main className="flex-1">
        <section className="py-16 bg-gradient-hero">
          <div className="container text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Have questions? We'd love to hear from you.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  {[
                    { icon: MapPin, title: "Address", content: "123 Kenyatta Avenue, Nairobi, Kenya" },
                    { icon: Phone, title: "Phone", content: "+254 742 324 193" },
                    { icon: Mail, title: "Email", content: "sales@tesslaequipment.com" },
                    { icon: Clock, title: "Hours", content: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM" },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-muted-foreground">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border space-y-6">
                <h2 className="font-serif text-2xl font-bold">Send a Message</h2>
                {["name", "email", "phone"].map((field) => (
                  <input key={field} type={field === "email" ? "email" : "text"} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} required={field !== "phone"} value={formData[field as keyof typeof formData]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                ))}
                <textarea placeholder="Your message" required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                <Button type="submit" variant="hero" size="lg" className="w-full"><Send className="h-4 w-4" />Send Message</Button>
              </motion.form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
