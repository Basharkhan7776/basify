import { PageTransition } from "@/components/app/page-transition"
import { CreatePoolForm } from "@/components/pools/create-pool-form"

export default function CreatePoolPage() {
  return (
    <PageTransition>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Create Pool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Configure a new rotating liquidity pool
        </h1>
      </section>
      <CreatePoolForm />
    </PageTransition>
  )
}
