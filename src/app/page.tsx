export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">CareSlot</span>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Clinic appointments, simplified
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Book your next visit in under a minute.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
          Pick a time that works for you, secure it with a deposit, and receive
          confirmation and reminders by email. No phone calls required.
        </p>

        <div className="mt-10">
          <span
            aria-disabled="true"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-muted px-6 text-sm font-medium text-muted-foreground"
          >
            Booking opens soon
          </span>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
          &copy; {new Date().getFullYear()} CareSlot
        </div>
      </footer>
    </div>
  );
}
