import Config

# Configure your database
config :electric_phoenix_example, Electric.PhoenixExample.Repo,
  username: "postgres",
  password: "password",
  hostname: "localhost",
  database: "electric",
  port: 54321,
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we can use it
# to bundle .js and .css sources.
config :electric_phoenix_example, Electric.PhoenixExampleWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {0, 0, 0, 0}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "dNSXyPFTrR0O7cN4ZJEdRlDL/NoBisUMHLx2dnJWJjveO9LWiY1f9Jmtkbt5JxvZ",
  watchers: [
    esbuild:
      {Esbuild, :install_and_run, [:electric_phoenix_example, ~w(--sourcemap=inline --watch)]},
    tailwind: {Tailwind, :install_and_run, [:electric_phoenix_example, ~w(--watch)]}
  ]

# ## SSL Electric.PhoenixExample
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# Mix task:
#
#     mix phx.gen.cert
#
# Run `mix help phx.gen.cert` for more information.
#
# The `http:` config above can be replaced with:
#
#     https: [
#       port: 4001,
#       cipher_suite: :strong,
#       keyfile: "priv/cert/selfsigned_key.pem",
#       certfile: "priv/cert/selfsigned.pem"
#     ],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :electric_phoenix_example, Electric.PhoenixExampleWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/(?!uploads/).*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/electric_phoenix_example_web/(controllers|live|components)/.*(ex|heex)$"
    ]
  ]

# Enable dev routes for dashboard and mailbox
config :electric_phoenix_example, dev_routes: true

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :phoenix_live_view,
  # Include HEEx debug annotations as HTML comments in rendered markup
  debug_heex_annotations: true,
  # Enable helpful, but potentially expensive runtime checks
  enable_expensive_runtime_checks: true

config :electric_phoenix, Electric.Client,
  base_url: System.get_env("ELECTRIC_URL", "http://localhost:3000/"),
  params: System.get_env("ELECTRIC_CLIENT_PARAMS", "{}") |> :json.decode()
