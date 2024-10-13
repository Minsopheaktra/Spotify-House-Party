from django.http import JsonResponse
import logging
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room

logger = logging.getLogger(__name__)


# API Views creation
class RoomView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_serializer_context(self):
        return {"request": self.request}


class GetRoom(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        code = request.GET.get("code")
        if code is not None:
            room = Room.objects.filter(code=code).first()

            logger.info(f"Authenticated user: {request.user}")
            if room:
                is_host = room.host == request.user  # Check if the user is the host
                data = RoomSerializer(room).data
                data["is_host"] = is_host  # Add host information to the response

                logger.info(f"Host ID: {room.host.id}, is_host: {is_host}")
                return Response(data, status=status.HTTP_200_OK)
            else:
                logger.warning("Room not found for code: %s", code)
                return Response(
                    {"Room Not Found": "Invalid Room Code."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        logger.warning("Code parameter not found in request")
        return Response(
            {"Bad Request": "Code Parameter not found in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class JoinRoom(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        code = request.data.get("code")
        if code:
            room = Room.objects.filter(code=code).first()
            if room:
                return Response({"message": "Room Joined!"}, status=status.HTTP_200_OK)

            return Response(
                {"Bad Request": "Invalid room code"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"Bad Request": "Invalid post data, did not find a code key"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateRoomView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        user = request.user  # Get the authenticated user

        logger.info(f"Authenticated user: {user}")  # Log the user information

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.validated_data.get("guest_can_pause")
            votes_to_skip = serializer.validated_data.get("votes_to_skip")

            queryset = Room.objects.filter(host=user)

            if queryset.exists():
                # Update the existing room for this host
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])

                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                # Create a new room
                room = Room(
                    host=user,
                    guest_can_pause=guest_can_pause,
                    votes_to_skip=votes_to_skip,
                )
                room.save()
                return Response(
                    RoomSerializer(room).data, status=status.HTTP_201_CREATED
                )
        else:
            logger.error(serializer.errors)  # Log errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        room = Room.objects.filter(
            host=user
        ).first()  # Fetch the room hosted by the user

        if room:
            data = {"code": room.code}
            return JsonResponse(data, status=status.HTTP_200_OK)
        else:
            return JsonResponse({"code": None}, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        room_result = Room.objects.filter(host=user)
        if room_result.exists():
            room = room_result.first()
            room.delete()  # Delete the room if the user is the host
            return Response(
                {"Message": "Room deleted successfully"}, status=status.HTTP_200_OK
            )

        return Response(
            {"Message": "No room found for the user"}, status=status.HTTP_404_NOT_FOUND
        )


class UpdateRoom(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        user = request.user

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.validated_data.get("guest_can_pause")
            votes_to_skip = serializer.validated_data.get("votes_to_skip")
            code = serializer.validated_data.get("code")

            room = Room.objects.filter(code=code).first()
            if not room:
                return Response(
                    {"Message": "Room Not Found"}, status=status.HTTP_404_NOT_FOUND
                )

            if room.host != user:
                return Response(
                    {"Message": "You are not the host of this room"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Update the room fields
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause", "votes_to_skip"])

            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response(
            {"Bad Request": "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST
        )
