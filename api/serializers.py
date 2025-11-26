from rest_framework import serializers
from api.models import Member, Message


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, max_length=128)

    class Meta:
        model = Member
        fields = ['username', 'password']

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        member = Member(
            username=validated_data['username']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()


class ChatMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='member.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'username', 'text', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['text']

    def validate_text(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Text field is required")
        if len(value) > 1000:
            raise serializers.ValidationError("Text must not exceed 1000 characters")
        return value
