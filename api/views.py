from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    MessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    TokenSerializer,
    MemberSerializer,
    ChatMessageSerializer,
    CreateMessageSerializer
)
from .models import Member, Message


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    Register a new user and return JWT token.
    """
    permission_classes = []

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: TokenSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        description="Create a new user account with username and password"
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            refresh = RefreshToken.for_user(member)
            token = str(refresh.access_token)
            return Response({"token": token}, status=status.HTTP_201_CREATED)
        
        error_message = "Username already exists"
        if 'username' in serializer.errors:
            error_message = serializer.errors['username'][0]
        elif 'password' in serializer.errors:
            error_message = serializer.errors['password'][0]
        else:
            error_message = str(serializer.errors)
        
        return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate user and return JWT token.
    """
    permission_classes = []

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: TokenSerializer,
            401: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        description="Authenticate user with username and password"
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        try:
            member = Member.objects.get(username=username)
            if member.check_password(password):
                refresh = RefreshToken.for_user(member)
                token = str(refresh.access_token)
                return Response({"token": token}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)
        except Member.DoesNotExist:
            return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(APIView):
    """
    Get current authenticated user information.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: MemberSerializer,
            401: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        description="Retrieve information about the currently authenticated user"
    )
    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessagesListView(APIView):
    """
    Get all chat messages.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: {"type": "object", "properties": {"messages": {"type": "array", "items": ChatMessageSerializer}}},
            401: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        description="Retrieve all chat messages with user information and timestamps"
    )
    def get(self, request):
        messages = Message.objects.select_related('member').all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({"messages": serializer.data}, status=status.HTTP_200_OK)


class MessageCreateView(APIView):
    """
    Create a new chat message.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CreateMessageSerializer,
        responses={
            201: ChatMessageSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            401: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        description="Create and send a new chat message"
    )
    def post(self, request):
        serializer = CreateMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(member=request.user)
            response_serializer = ChatMessageSerializer(message)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        error_message = "Text field is required"
        if 'text' in serializer.errors:
            error_message = serializer.errors['text'][0]
        else:
            error_message = str(serializer.errors)
        
        return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)
