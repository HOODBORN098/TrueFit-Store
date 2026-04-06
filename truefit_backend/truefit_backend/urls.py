from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import RedirectView

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
    path('', api_root),
    path('health/', health_check),
    path('admin/', admin.site.urls),  # Make sure this is correct
    path('api/', include('products.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)