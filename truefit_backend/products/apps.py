from django.apps import AppConfig
import os
import sys

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'

    def ready(self):
        """
        Run migrations automatically when the app is ready.
        Only triggers on Render (to avoid issues during local dev/tests).
        """
        # Only run if RENDER environmental variable is set
        if os.environ.get('RENDER'):
            # Only run if not already running a command that would conflict
            if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv:
                try:
                    from django.core.management import call_command
                    print("=" * 50)
                    print("RUNNING MIGRATIONS FROM AppConfig.ready()...")
                    print("=" * 50)
                    call_command('migrate', interactive=False, verbosity=1)
                    print("✓ Migrations completed successfully")
                except Exception as e:
                    print(f"✗ Migration error (non-fatal): {e}")
                    import traceback
                    traceback.print_exc()
                print("=" * 50)
