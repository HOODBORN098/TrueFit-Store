from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ProductListAPIView,
    ProductDetailAPIView,
    CollectionListAPIView,
    CollectionDetailAPIView,
    RegisterView,
    CustomTokenObtainPairView,
    OrderCreateView,
    MyOrdersView,
    NewsletterSubscribeView,
)

urlpatterns = [
    # Core API Endpoints
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('collections/', CollectionListAPIView.as_view(), name='collection-list'),
    path('collections/<int:pk>/', CollectionDetailAPIView.as_view(), name='collection-detail'),

    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Orders Endpoints
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/me/', MyOrdersView.as_view(), name='my-orders'),

    # Newsletter Endpoints
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]