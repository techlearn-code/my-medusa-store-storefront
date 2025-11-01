"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { decodeToken } from "react-jwt"
import { sdk } from "@lib/config"
import { setSession } from '@lib/data/auth'

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()
  // for other than Next.js
  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return Object.fromEntries(searchParams.entries())
  }, [])

  const sendCallback = async () => {
    let token = ""

    try {
      token = await sdk.auth.callback(
        "customer", 
        "google", 
        // pass all query parameters received from the
        // third party provider
        queryParams
      )
    } catch (error) {
      alert("Authentication Failed")
      
      throw error
    }

    return token
  }

  const createCustomer = async (email: string) => {
    // create customer
    await sdk.store.customer.create({
      email,
    })
  }

  const refreshToken = async () => {
    // refresh the token
    const result = await sdk.auth.refresh()
  }

  const validateCallback = async () => {
    const token = await sendCallback()
  
    console.log("token: ", token);
    const decodedToken = decodeToken(token) as { actor_id: string, user_metadata: Record<string, unknown> }
    console.log("decodedToken: ", decodedToken);
    const shouldCreateCustomer = decodedToken.actor_id === ""
    console.log("shouldCreateCustomer: ", shouldCreateCustomer);
    await setSession(token)
    if (shouldCreateCustomer) {
      await createCustomer(decodedToken.user_metadata.email as string)
  
      await refreshToken()
    }
  
    // use token to send authenticated requests
    const { customer: customerData } =  await sdk.store.customer.retrieve()
  
    setCustomer(customerData)
    setLoading(false)
  }
  
  
  useEffect(() => {
    if (!loading) {
      return
    }
  
    validateCallback()
  }, [loading])

  useEffect(() => {
    if (!customer) {
      return
    }
  
    // redirect to homepage after successful authentication
    window.location.href = "/"
  }, [customer])

  return (
    <div>
      {loading && <span>Loading...</span>}
      {customer && <span>Created customer {customer.email} with Google.</span>}
    </div>
  )
}
