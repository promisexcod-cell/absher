import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Camera, FileText, Search, Shield, Users, ArrowLeft, LogIn, LogOut, User } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: missingPersons } = trpc.missingPerson.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">نظام تتبع المفقودين</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-300 text-sm hidden sm:block">
                  مرحباً، {user?.name || "مستخدم"}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="w-4 h-4 ml-2" />
                تسجيل الدخول
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-full text-sm mb-6">
            <Shield className="w-4 h-4" />
            نظام متكامل للبحث عن المفقودين
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            ساعدنا في العثور على
            <br />
            <span className="text-emerald-400">الأشخاص المفقودين</span>
          </h2>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            منصة متطورة للإبلاغ عن الأشخاص المفقودين والبحث عنهم باستخدام تقنيات التعرف على الوجوه
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
                <FileText className="w-5 h-5 ml-2" />
                إبلاغ عن مفقود
              </Button>
            </Link>
            <Link href="/detection">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 text-lg px-8 py-6">
                <Camera className="w-5 h-5 ml-2" />
                البحث بالكاميرا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            كيف يعمل النظام؟
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">1. تقديم البلاغ</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 text-base">
                  قم بإدخال معلومات الشخص المفقود وصورته من خلال نموذج البلاغ المتكامل
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">2. تسجيل في قاعدة البيانات</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 text-base">
                  يتم تسجيل البلاغ في قاعدة بيانات المفقودين ليتم البحث عنه في جميع الكاميرات
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">3. البحث بالكاميرات</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 text-base">
                  يتم البحث عن الشخص المفقود من خلال كاميرات المراقبة باستخدام تقنية التعرف على الوجوه
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                {missingPersons?.length || 0}
              </div>
              <div className="text-slate-400">بلاغات نشطة</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">24/7</div>
              <div className="text-slate-400">مراقبة مستمرة</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">AI</div>
              <div className="text-slate-400">تقنية ذكية</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">100%</div>
              <div className="text-slate-400">مجاني</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-emerald-600/10">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            هل فقدت شخصاً عزيزاً؟
          </h3>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            لا تتردد في تقديم بلاغ الآن. كل دقيقة مهمة في البحث عن المفقودين.
          </p>
          <Link href="/report">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              ابدأ الآن
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-700">
        <div className="container mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 نظام تتبع المفقودين - جميع الحقوق محفوظة</p>
          <p className="mt-2">هذا النظام للعرض التوضيحي فقط</p>
        </div>
      </footer>
    </div>
  );
}
