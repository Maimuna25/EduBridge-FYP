from django.dispatch import receiver
from django.core.mail import send_mail
from django_rest_passwordreset.signals import reset_password_token_created


FRONTEND_URL = "https://overstep-crown-buddhism.ngrok-free.dev"


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    reset_url = f"{FRONTEND_URL}/reset-password/{reset_password_token.key}"

    email_plaintext_message = f"""
    Use the link below to reset your password:

    {reset_url}
    """

    send_mail(
        subject="Password Reset for Your Account",
        message=email_plaintext_message,
        from_email=None,
        recipient_list=[reset_password_token.user.email],
    )