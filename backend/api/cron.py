from datetime import datetime
from .models import UserSettings
from .utils import send_study_reminder_email


def check_and_send_reminders():

    now = datetime.now().strftime("%H:%M")

    print(f"⏰ Checking reminders at {now}")

    settings = UserSettings.objects.filter(
        notifications_enabled=True,
        reminder_time__isnull=False
    )

    for setting in settings:

        reminder_time = setting.reminder_time.strftime("%H:%M")

        if reminder_time == now:

            print(f"📧 Sending reminder to {setting.user.email}")

            send_study_reminder_email(setting.user)