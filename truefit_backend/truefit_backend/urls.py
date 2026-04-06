from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Health check for Render
def health_check(request):
    return JsonResponse({"status": "ok", "message": "TrueFIT API is running"})

# Root API endpoint
def api_root(request):
    return JsonResponse({
        "message": "Welcome to TrueFIT API",
        "endpoints": {
            "products": "/api/products/",
            "collections": "/api/collections/",
            "admin": "/admin/",
            "health": "/health/"
        }
    })

urlpatterns = [
    path('', api_root),  # Root URL now returns JSON instead of 404
    path('health/', health_check),  # Health check endpoint
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)