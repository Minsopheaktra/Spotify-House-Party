from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    is_host = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = (
            "id",
            "code",
            "host",
            "guest_can_pause",
            "votes_to_skip",
            "created_at",
            "is_host",
        )

    def get_is_host(self, obj):
        request = self.context.get("request")
        return obj.host == request.user.id if request else False


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip")


class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip", "code")
