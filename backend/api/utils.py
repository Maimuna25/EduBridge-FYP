from django.core.mail import send_mail
from django.conf import settings


def send_study_reminder_email(user):

    if not user.email:
        print(f"⚠️ No email for {user.username}")
        return

    print(f"📧 Sending email to {user.email}")

    try:
        send_mail(
            subject="📚 Study Reminder",
            message=f"Hi {user.username},\n\nTime to continue your learning on EduBridge!",
            from_email=settings.EMAIL_HOST_USER,  # ✅ FIXED
            recipient_list=[user.email],
            fail_silently=False,
        )

        print("✅ Email sent successfully")

    except Exception as e:
        print(f"❌ Email failed: {e}")