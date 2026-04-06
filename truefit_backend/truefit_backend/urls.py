from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.contrib.auth import get_user_model

def health_check(request):
    return JsonResponse({"status": "ok", "message": "TrueFIT API is running"})

def api_root(request):
    return JsonResponse({
        "message": "Welcome to TrueFIT API",
        "endpoints": {
            "products": "/api/products/",
            "collections": "/api/collections/",
            "admin": "/admin/",
            "health": "/health/",
            "create-admin": "/create-admin/"
        }
    })

def create_admin(request):
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='truefit_admin',
        defaults={
            'email': 'admin@truefit.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        user.set_password('Truefit123!')
        user.save()
        return JsonResponse({"status": "created", "username": "truefit_admin", "password": "Truefit123!"})
    else:
        user.set_password('Truefit123!')
        user.save()
        return JsonResponse({"status": "reset", "username": "truefit_admin", "password": "Truefit123!"})

urlpatterns = [
    path('', api_root),
    path('health/', health_check),
    path('create-admin/', create_admin),
    path('admin-test/', lambda request: JsonResponse({'status': 'admin-test-works'})),
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
]