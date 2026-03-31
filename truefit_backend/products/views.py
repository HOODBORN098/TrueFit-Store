from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import Product, Collection, Order
from .serializers import (
    ProductSerializer, CollectionSerializer, 
    UserSerializer, OrderSerializer
)


# ── Throttle classes (rate limiting) ──────────────────────────────────────────

class StrictAnonThrottle(AnonRateThrottle):
    """Stricter throttle for write (POST) endpoints to prevent abuse."""
    rate = '20/min'


# ── Product Views ──────────────────────────────────────────────────────────────

class ProductListAPIView(generics.ListCreateAPIView):
    """
    GET  /api/products/  — List all products (paginated, filterable, searchable).
    POST /api/products/  — Create a new product (validated, rate-limited).

    Query parameters:
        ?category=Hoodies      — Filter by category
        ?featured=true         — Filter featured products
        ?newArrival=true       — Filter new arrivals
        ?search=cargo          — Full-text search on name and description
        ?ordering=-price       — Order by price descending
        ?page=2                — Pagination
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    pagination_class = PageNumberPagination

    # Filtering & search
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'featured', 'newArrival']
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['price', 'created_at', 'name', 'stock']

    def get_throttles(self):
        """Apply stricter rate limiting to POST (create) requests."""
        if self.request.method == 'POST':
            return [StrictAnonThrottle()]
        return [AnonRateThrottle(), UserRateThrottle()]


class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/products/<id>/  — Retrieve a single product.
    PATCH  /api/products/<id>/  — Partially update a product.
    DELETE /api/products/<id>/  — Delete a product.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_throttles(self):
        if self.request.method in ('PATCH', 'PUT', 'DELETE'):
            return [StrictAnonThrottle()]
        return [AnonRateThrottle(), UserRateThrottle()]


# ── Collection Views ───────────────────────────────────────────────────────────

class CollectionListAPIView(generics.ListCreateAPIView):
    """
    GET  /api/collections/  — List all collections.
    POST /api/collections/  — Create a new collection (rate-limited).
    """
    queryset = Collection.objects.all().order_by('-created_at')
    serializer_class = CollectionSerializer
    pagination_class = None  # Show all at once (collections are usually few)

    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_throttles(self):
        if self.request.method == 'POST':
            return [StrictAnonThrottle()]
        return [AnonRateThrottle(), UserRateThrottle()]


class CollectionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/collections/<id>/  — Retrieve a single collection.
    PATCH  /api/collections/<id>/  — Partially update.
    DELETE /api/collections/<id>/  — Delete.
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

    def get_throttles(self):
        if self.request.method in ('PATCH', 'PUT', 'DELETE'):
            return [StrictAnonThrottle()]
        return [AnonRateThrottle(), UserRateThrottle()]


# ── Auth & Order Views ─────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    # Allow anonymous checkouts (guest) or authenticated
    permission_classes = (AllowAny,)

    def get_throttles(self):
        return [StrictAnonThrottle()]

class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
