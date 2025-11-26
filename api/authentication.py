from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from api.models import Member


class MemberJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication for Member model.
    """

    def get_user(self, validated_token):
        """
        Attempts to find and return a member using the given validated token.
        """
        try:
            user_id = validated_token.get('user_id')
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')

        try:
            member = Member.objects.get(id=user_id)
        except Member.DoesNotExist:
            raise InvalidToken('User not found')

        return member
