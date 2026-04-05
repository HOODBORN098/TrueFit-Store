from django.urls import path
from .views import (
    ProductListAPIView,
    ProductDetailAPIView,
    CollectionListAPIView,
    CollectionDetailAPIView,
    RegisterView,
    OrderCreateView,
    MyOrdersView,
    CustomTokenObtainPairView,
    NewsletterSubscribeView,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Products
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),

    # Collections
    path('collections/', CollectionListAPIView.as_view(), name='collection-list'),
    path('collections/<int:pk>/', CollectionDetailAPIView.as_view(), name='collection-detail'),

    # Orders
    path('orders/', MyOrdersView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),

    # Newsletter
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]
