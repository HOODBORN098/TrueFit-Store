from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
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
        }
    })

def create_admin(request):
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='truefit_admin',
        defaults={'email': 'admin@truefit.com', 'is_staff': True, 'is_superuser': True}
    )
    user.set_password('Truefit123!')
    user.save()
    return JsonResponse({"status": "success", "username": "truefit_admin", "password": "Truefit123!"})

def list_users(request):
    User = get_user_model()
    users = User.objects.filter(is_superuser=True).values('id', 'username', 'email')
    return JsonResponse({"superusers": list(users)})

def reset_password(request):
    User = get_user_model()
    username = request.GET.get('username', '')
    if not username:
        return JsonResponse({"error": "Provide ?username=xxx"})
    try:
        user = User.objects.get(username=username)
        user.set_password('password123')
        user.save()
        return JsonResponse({"status": "reset", "username": username, "new_password": "password123"})
    except User.DoesNotExist:
        return JsonResponse({"error": f"User '{username}' not found"})

urlpatterns = [
    path('', api_root),
    path('health/', health_check),
    path('create-admin/', create_admin),
    path('list-users/', list_users),
    path('reset-password/', reset_password),
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)