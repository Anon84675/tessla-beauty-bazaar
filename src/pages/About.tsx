import { motion } from "framer-motion";
import { Target, Heart, Users, Award, Clock, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/layout/CartSidebar";

const About = () => {
  const stats = [
    { number: "500+", label: "Happy Clients" },
    { number: "2000+", label: "Products Sold" },
    { number: "7+", label: "Years Experience" },
    { number: "50+", label: "Brands Available" },
  ];

  const values = [
    {
      icon: Target,
      title: "Quality First",
      description: "We partner only with trusted manufacturers to bring you equipment that meets the highest industry standards."
    },
    {
      icon: Heart,
      title: "Customer Focused",
      description: "Your success is our priority. We provide expert guidance to help you choose the right equipment for your business."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "We're proud to support the beauty industry in Kenya and across East Africa with reliable equipment and service."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "From product selection to after-sales support, we strive for excellence in everything we do."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                About Us
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Your Partner in Professional Beauty Equipment
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Since 2018, Tessla Equipment Stores has been the trusted source for professional 
                salon, barbershop, and spa equipment in Kenya. We're committed to helping beauty 
                professionals succeed with quality products and exceptional service.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-gradient-primary">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center text-primary-foreground"
                >
                  <p className="font-serif text-4xl md:text-5xl font-bold mb-2">{stat.number}</p>
                  <p className="text-primary-foreground/80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent-dark rounded-full text-sm font-medium mb-4">
                  Our Mission
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                  Empowering Beauty Professionals with Premium Equipment
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  At Tessla Equipment Stores, we believe that every beauty professional deserves access 
                  to quality equipment that helps them deliver exceptional services. Our mission is to 
                  be the bridge between world-class manufacturers and local businesses, providing not 
                  just products, but complete solutions for success.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We carefully curate our product range from leading global brands, ensuring that each 
                  item meets our strict quality standards. From barber chairs to spa equipment, every 
                  product we offer is designed to elevate your business and delight your clients.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=800&fit=crop"
                    alt="Salon interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-elegant p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Since 2018</p>
                      <p className="text-sm text-muted-foreground">Serving Professionals</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Our Values
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                What Drives Us
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our core values guide everything we do, from product selection to customer service.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:shadow-elegant transition-shadow"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-20">
          <div className="container">
            <div className="bg-gradient-dark rounded-3xl p-8 md:p-12 text-primary-foreground">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-accent" />
                    <span className="text-accent font-medium">Visit Our Showroom</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                    Experience Our Products in Person
                  </h2>
                  <p className="text-primary-foreground/80 mb-6">
                    Visit our showroom in Nairobi to see our products firsthand. Our expert team 
                    is ready to help you find the perfect equipment for your business.
                  </p>
                  <div className="space-y-3">
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                  Raiciri House 2nd Floor Shop 203,<br />
                  Next to Accra Hotel Building <br />
                  Accra Road, Embassava Buses Stage <br />
                  Nairobi, Kenya
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      Mon - Sat: 8:30 AM - 5:00 PM
                    </p>
                    
                  </div>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop"
                    alt="Showroom"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
