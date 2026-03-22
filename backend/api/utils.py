from django.core.mail import send_mail

def send_study_reminder_email(user):

    if not user.email:
        print(f"⚠️ No email for {user.username}")
        return

    send_mail(
        subject="📚 Study Reminder",
        message=f"Hi {user.username},\n\nTime to continue your learning on EduBridge!",
        from_email="EduBridge <maimunanowaz@gmail.com>",
        recipient_list=[user.email],
        fail_silently=False,
    )