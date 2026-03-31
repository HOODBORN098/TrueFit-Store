from rest_framework import serializers
from .models import Product, Collection, Order, OrderItem
from django.contrib.auth.models import User
import re


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model with server-side input validation.
    """

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number greater than zero.")
        if value > 10_000_000:
            raise serializers.ValidationError("Price value seems unreasonably large. Please double-check.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Product name must be at least 3 characters long.")
        if len(value) > 200:
            raise serializers.ValidationError("Product name must be 200 characters or fewer.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value

    def validate_image_url(self, value):
        if value and not re.match(r'^https?://', value):
            raise serializers.ValidationError("Image URL must start with http:// or https://")
        return value

    def validate_sizes(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Sizes must be a list, e.g. [\"S\", \"M\", \"L\"]")
        for size in value:
            if not isinstance(size, str) or len(size.strip()) == 0:
                raise serializers.ValidationError("Each size entry must be a non-empty string.")
        return value

    def validate_colors(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Colors must be a list, e.g. [\"Black\", \"White\"]")
        for color in value:
            if not isinstance(color, str) or len(color.strip()) == 0:
                raise serializers.ValidationError("Each color entry must be a non-empty string.")
        return value


class CollectionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Collection model with server-side input validation.
    """

    class Meta:
        model = Collection
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'created_at')

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Collection name must be at least 3 characters long.")
        return value

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ('order',)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('id', 'user', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        order = Order.objects.create(user=user, **validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order
