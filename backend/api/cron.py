
from django.utils import timezone
from .models import UserSettings
from .utils import send_study_reminder_email

# This function is intended checks which users should receive reminder emails
def check_and_send_reminders():
    try:
        print("\n========== 🚀 CRON START ==========")

        now = timezone.localtime()

        print(f"🌍 DJANGO TIME: {now}")
        print(f"⏰ NOW: {now.hour}:{now.minute}")

        # Get all users who enabled notifications and selected a reminder time
        settings = UserSettings.objects.filter(
            notifications_enabled=True,
            reminder_time__isnull=False
        )

        print(f"👥 TOTAL SETTINGS FOUND: {settings.count()}")

        if not settings.exists():
            print("⚠️ No users with reminders enabled")

        for setting in settings:
            try:
                print("\n------ 👤 CHECKING USER ------")

                user = setting.user

                print(f"👤 USER: {user.username}")
                print(f"📧 EMAIL: {user.email}")
                print(f"🔔 ENABLED: {setting.notifications_enabled}")
                print(f"🎯 REMINDER TIME: {setting.reminder_time}")
                print(f"📌 LAST SENT REMINDER: {setting.last_sent_reminder_time}")

                reminder_time = setting.reminder_time

                print("🧠 COMPARISON:")
                print(f"   → NOW TIME: {now.time()}")
                print(f"   → REMINDER TIME: {reminder_time}")

                time_condition = reminder_time <= now.time()

                already_sent_for_this_time = (
                    setting.last_sent_reminder_time == reminder_time
                )

                print(f"⏱ TIME CONDITION (reminder <= now): {time_condition}")
                print(f"📬 ALREADY SENT FOR THIS TIME: {already_sent_for_this_time}")

                if time_condition and not already_sent_for_this_time:

                    if not user.email:
                        print(f"⚠️ No email for {user.username} — SKIPPING")
                        continue

                    print(f"SENDING ONE-TIME REMINDER TO: {user.email}")

                    try:
                        send_study_reminder_email(user)
                        print("✅ EMAIL SENT SUCCESSFULLY")

                    except Exception as email_error:
                        print(f"EMAIL SEND FAILED: {email_error}")
                        continue

                    setting.last_sent_reminder_time = reminder_time
                    setting.save()

                    print("DATABASE UPDATED (marked as sent for this time)")

                else:
                    print(" CONDITION NOT MET — skipping user")


            except Exception as inner_error:
                print(f" USER ERROR: {inner_error}")

        print("========== CRON END ==========\n")

    # Catch overall cron errors
    except Exception as e:
        print(f"🔥 CRON ERROR: {e}")