from diagrams import Diagram
from diagrams.onprem.client import Users
from diagrams.programming.framework import Django
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python
from diagrams.onprem.compute import Server
from diagrams.onprem.network import Internet

with Diagram("EduBridge System Architecture", show=True):

    student = Users("Student")

    frontend = Server("Web Frontend")

    backend = Django("Django REST Framework API")

    quiz = Python("Quiz Engine")

    ai_explain = Python("AI Explanation System")

    chat = Python("AI Chat Tutor")

    analytics = Python("Learning Analytics")

    database = PostgreSQL("Learning Database")

    openai = Internet("OpenAI API")

    student >> frontend >> backend

    backend >> quiz
    backend >> ai_explain
    backend >> chat
    backend >> analytics
    backend >> database

    ai_explain >> openai
    chat >> openai