import os
import sys
from django.core.wsgi import get_wsgi_application

# FORCE MIGRATIONS - MUST RUN BEFORE APP STARTS
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truefit_backend.settings')

try:
    from django.core.management import call_command
    print("=" * 50, flush=True)
    print("RUNNING MIGRATIONS FROM WSGI.PY...", flush=True)
    print("=" * 50, flush=True)
    call_command('migrate', interactive=False, verbosity=3)
    print("✓ Migrations completed", flush=True)
except Exception as e:
    print(f"Migration error: {e}", flush=True)

# Normal WSGI application
application = get_wsgi_application()
