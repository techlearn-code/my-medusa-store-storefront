"use client" // include with Next.js 13+

import { sdk } from "@lib/config"
import { Google } from '@medusajs/icons'
import { Button, Text } from '@medusajs/ui'

export default function GoogleLogin() {
  const loginWithGoogle = async () => {
    const result = await sdk.auth.login("customer", "google", {})

    if (typeof result === "object" && result.location) {
      // redirect to Google for authentication
      window.location.href = result.location

      return
    }
    
    if (typeof result !== "string") {
      // result failed, show an error
      alert("Authentication failed")
      return
    }

    // Customer was previously authenticated, and its token is now stored in the JS SDK.
    // all subsequent requests are authenticated
    const { customer } = await sdk.store.customer.retrieve()

    console.log(customer)
  }

  return (
    <Button size="large" variant="secondary" className="w-full mt-6 font-quicksand" onClick={loginWithGoogle}>
      <Google />
      <Text className="font-semibold">Login with Google</Text>
    </Button>
  )
}
