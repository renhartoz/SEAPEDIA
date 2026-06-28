from django.urls import path
from .views import (
    DriverJobListView,
    DriverJobDetailView,
    DriverTakeJobView,
    DriverCompleteJobView,
    DriverJobHistoryView,
    DriverEarningsView,
)

urlpatterns = [
    path("jobs/", DriverJobListView.as_view()),
    path("jobs/<uuid:pk>/", DriverJobDetailView.as_view()),
    path("jobs/<uuid:pk>/take/", DriverTakeJobView.as_view()),
    path("jobs/<uuid:pk>/complete/", DriverCompleteJobView.as_view()),
    path("history/", DriverJobHistoryView.as_view()),
    path("earnings/", DriverEarningsView.as_view()),
]
