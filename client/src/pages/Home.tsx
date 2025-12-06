import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Search, 
  FileText, 
  Camera, 
  Shield, 
  Users, 
  Bell,
  ChevronLeft,
  LogOut,
  User,
  Menu
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    {
      icon: FileText,
      title: "الإبلاغ عن مفقود",
      description: "تقديم بلاغ عن شخص مفقود مع إرفاق صورته ومعلوماته",
      href: "/report",
      color: "bg-[#1B7D3E]"
    },
    {
      icon: Camera,
      title: "البحث بالكاميرا",
      description: "استخدام تقنية التعرف على الوجوه للبحث عن المفقودين",
      href: "/detection",
      color: "bg-[#2E8B57]"
    },
    {
      icon: Search,
      title: "البحث في السجلات",
      description: "البحث في قاعدة بيانات المفقودين المسجلين",
      href: "/detection",
      color: "bg-[#4CAF50]"
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "أمان وخصوصية",
      description: "حماية كاملة لبيانات المفقودين والمبلغين"
    },
    {
      icon: Users,
      title: "تعاون مجتمعي",
      description: "مشاركة المعلومات مع الجهات المختصة"
    },
    {
      icon: Bell,
      title: "تنبيهات فورية",
      description: "إشعارات عند العثور على أي تطابق"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
      {/* Header - Absher Style */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1B7D3E] rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-[#1B7D3E]">نظام تتبع المفقودين</h1>
                <p className="text-xs text-gray-500 hidden sm:block">وزارة الداخلية</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-[#1B7D3E] font-medium transition-colors">
                الرئيسية
              </Link>
              <Link href="/report" className="text-gray-700 hover:text-[#1B7D3E] font-medium transition-colors">
                إبلاغ عن مفقود
              </Link>
              <Link href="/detection" className="text-gray-700 hover:text-[#1B7D3E] font-medium transition-colors">
                البحث بالكاميرا
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 border-2 border-[#1B7D3E] border-t-transparent rounded-full animate-spin" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user?.name || "مستخدم"}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => logout()}
                    className="border-[#1B7D3E] text-[#1B7D3E] hover:bg-[#1B7D3E] hover:text-white"
                  >
                    <LogOut className="w-4 h-4 ml-1" />
                    <span className="hidden sm:inline">خروج</span>
                  </Button>
                </div>
              ) : (
                <Link href="/report">
                  <Button className="bg-[#1B7D3E] hover:bg-[#156332] text-white">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <Link href="/" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  الرئيسية
                </Link>
                <Link href="/report" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  إبلاغ عن مفقود
                </Link>
                <Link href="/detection" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  البحث بالكاميرا
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section - Absher Style */}
      <section className="bg-gradient-to-l from-[#1B7D3E] to-[#2E8B57] text-white py-16 lg:py-24">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Shield className="w-4 h-4" />
                <span>نظام متكامل للبحث عن المفقودين</span>
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                ساعدنا في العثور على
                <br />
                <span className="text-[#C9A227]">الأشخاص المفقودين</span>
              </h2>
              
              <p className="text-lg text-white/90 max-w-lg">
                منصة متطورة للإبلاغ عن الأشخاص المفقودين والبحث عنهم باستخدام تقنيات التعرف على الوجوه المتقدمة
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/report">
                  <Button size="lg" className="bg-white text-[#1B7D3E] hover:bg-gray-100 font-bold">
                    <FileText className="w-5 h-5 ml-2" />
                    إبلاغ عن مفقود
                  </Button>
                </Link>
                <Link href="/detection">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#1B7D3E] font-bold bg-transparent">
                    <Camera className="w-5 h-5 ml-2" />
                    البحث بالكاميرا
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image/Illustration */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-60 h-60 bg-white/20 rounded-full flex items-center justify-center">
                    <Search className="w-32 h-32 text-white/80" />
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-0 right-0 bg-white rounded-lg p-3 shadow-lg">
                  <Users className="w-8 h-8 text-[#1B7D3E]" />
                </div>
                <div className="absolute bottom-10 left-0 bg-white rounded-lg p-3 shadow-lg">
                  <Bell className="w-8 h-8 text-[#C9A227]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">الخدمات المتاحة</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نقدم مجموعة من الخدمات المتكاملة للمساعدة في البحث عن المفقودين
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h4>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center text-[#1B7D3E] font-medium group-hover:gap-2 transition-all">
                      <span>المزيد</span>
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">لماذا نظامنا؟</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نظام متطور يجمع بين التقنية الحديثة والتعاون المجتمعي
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#1B7D3E]" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-l from-[#1B7D3E] to-[#2E8B57]">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            هل فقدت شخصاً عزيزاً؟
          </h3>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            لا تتردد في تقديم بلاغ. كل معلومة قد تساعد في العثور عليه
          </p>
          <Link href="/report">
            <Button size="lg" className="bg-white text-[#1B7D3E] hover:bg-gray-100 font-bold">
              <FileText className="w-5 h-5 ml-2" />
              قدم بلاغاً الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B3D2F] text-white py-12">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#1B7D3E]" />
                </div>
                <span className="font-bold text-lg">نظام تتبع المفقودين</span>
              </div>
              <p className="text-gray-400 text-sm">
                نظام إلكتروني متكامل للإبلاغ عن المفقودين والبحث عنهم
              </p>
            </div>
            
            <div>
              <h5 className="font-bold mb-4">روابط سريعة</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
                <li><Link href="/report" className="hover:text-white transition-colors">إبلاغ عن مفقود</Link></li>
                <li><Link href="/detection" className="hover:text-white transition-colors">البحث بالكاميرا</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold mb-4">تواصل معنا</h5>
              <p className="text-gray-400 text-sm">
                للاستفسارات والدعم الفني
                <br />
                support@missing-tracker.sa
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>جميع الحقوق محفوظة © 2024 نظام تتبع المفقودين</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
