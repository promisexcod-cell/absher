import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, CheckCircle, FileText, ArrowRight, Search, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLocation, Link } from "wouter";

export default function ReportForm() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "" as "male" | "female" | "",
    nationalId: "",
    phoneNumber: "",
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
  });
  
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const createMutation = trpc.missingPerson.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("تم إرسال البلاغ بنجاح");
      setTimeout(() => {
        navigate("/detection");
      }, 2000);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إرسال البلاغ");
      console.error(error);
    },
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      toast.error("لا يمكن الوصول إلى الكاميرا");
      console.error(error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhotoBase64(dataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.gender) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createMutation.mutateAsync({
        fullName: formData.fullName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as "male" | "female",
        nationalId: formData.nationalId || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        description: formData.description || undefined,
        lastSeenLocation: formData.lastSeenLocation || undefined,
        lastSeenDate: formData.lastSeenDate || undefined,
        photoBase64: photoBase64 || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-[#1B7D3E] rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-[#1B7D3E] hidden sm:block">نظام تتبع المفقودين</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.name || "مستخدم"}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => logout()}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-[#1B7D3E]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
        <Header />
        <div className="container mx-auto py-16">
          <Card className="max-w-md mx-auto bg-white border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#1B7D3E]" />
              </div>
              <CardTitle className="text-2xl text-gray-800">تسجيل الدخول مطلوب</CardTitle>
              <CardDescription className="text-gray-500">
                يجب تسجيل الدخول لإرسال بلاغ عن شخص مفقود
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button 
                className="w-full bg-[#1B7D3E] hover:bg-[#156332] text-white py-6 text-lg"
                onClick={() => window.location.href = getLoginUrl()}
              >
                تسجيل الدخول
              </Button>
              <Link href="/">
                <Button variant="ghost" className="w-full mt-3 text-gray-600">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
        <Header />
        <div className="container mx-auto py-16">
          <Card className="max-w-md mx-auto bg-white border-0 shadow-lg text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[#1B7D3E]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إرسال البلاغ بنجاح</h2>
              <p className="text-gray-500">جاري تحويلك إلى صفحة البحث...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
      <Header />
      
      {/* Page Header */}
      <div className="bg-gradient-to-l from-[#1B7D3E] to-[#2E8B57] text-white py-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <span>إبلاغ عن مفقود</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">إبلاغ عن شخص مفقود</h1>
          <p className="text-white/80 mt-2">أدخل معلومات الشخص المفقود وصورته للمساعدة في البحث عنه</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto bg-white border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B7D3E]" />
              نموذج البلاغ
            </CardTitle>
            <CardDescription className="text-gray-500">
              الحقول المميزة بـ (*) مطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Photo Section */}
              <div className="space-y-4">
                <Label className="text-gray-800 text-lg font-semibold">صورة الشخص المفقود</Label>
                
                {photoBase64 ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <img 
                      src={photoBase64} 
                      alt="صورة الشخص" 
                      className="w-full h-full object-cover rounded-xl border-4 border-[#1B7D3E] shadow-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-3 -right-3 rounded-full shadow-lg"
                      onClick={() => setPhotoBase64(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : isCameraOpen ? (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-md mx-auto rounded-xl border-2 border-gray-200 shadow-md"
                    />
                    <div className="flex gap-3 justify-center">
                      <Button type="button" onClick={capturePhoto} className="bg-[#1B7D3E] hover:bg-[#156332]">
                        <Camera className="w-4 h-4 ml-2" />
                        التقاط الصورة
                      </Button>
                      <Button type="button" variant="outline" onClick={stopCamera} className="border-gray-300">
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Button type="button" onClick={startCamera} className="bg-[#1B7D3E] hover:bg-[#156332]">
                      <Camera className="w-4 h-4 ml-2" />
                      فتح الكاميرا
                    </Button>
                    <Label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#1B7D3E] rounded-lg text-[#1B7D3E] hover:bg-[#E8F5E9] transition-colors font-medium">
                        <Upload className="w-4 h-4" />
                        رفع صورة
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </Label>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">المعلومات الشخصية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]"
                      placeholder="أدخل الاسم الكامل"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700">العمر</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]"
                      placeholder="أدخل العمر"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700">الجنس *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as "male" | "female" }))}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]">
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-gray-700">رقم الهوية</Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]"
                      placeholder="أدخل رقم الهوية"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-700">رقم الجوال</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Last Seen Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">معلومات آخر مشاهدة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastSeenLocation" className="text-gray-700">مكان آخر مشاهدة</Label>
                    <Input
                      id="lastSeenLocation"
                      value={formData.lastSeenLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastSeenLocation: e.target.value }))}
                      className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]"
                      placeholder="المدينة، الحي، الشارع"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastSeenDate" className="text-gray-700">تاريخ آخر مشاهدة</Label>
                    <Input
                      id="lastSeenDate"
                      type="date"
                      value={formData.lastSeenDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastSeenDate: e.target.value }))}
                      className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">وصف إضافي</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="border-gray-200 focus:border-[#1B7D3E] focus:ring-[#1B7D3E] min-h-[100px]"
                    placeholder="أي معلومات إضافية قد تساعد في التعرف على الشخص (الملابس، علامات مميزة، إلخ)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1B7D3E] hover:bg-[#156332] text-white py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 ml-2" />
                      إرسال البلاغ
                    </>
                  )}
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline" className="border-gray-300 text-gray-600 py-6">
                    إلغاء
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
