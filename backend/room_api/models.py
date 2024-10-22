from django.db import models
from django.contrib.auth.models import User
import string
import random


# a function that generates a unique code with length 6
def generate_unique_code():
    length = 6

    while True:
        code = "".join(
            random.choices(string.ascii_uppercase, k=length)
        )  # initialize that string code (code='') is a random sequence that must be an ascii uppercase with length 6
        if (
            Room.objects.filter(code=code).count() == 0
        ):  # if code is unique break while loop
            break

    return code  # return the unique code/roomcode


# Create your models here.


class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE)  # Change to ForeignKey
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(User, related_name="users")  # users in room

    def __str__(self):
        return self.code
