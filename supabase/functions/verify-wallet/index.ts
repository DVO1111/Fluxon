import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'
import * as base58 from 'https://esm.sh/bs58@5.0.0'
import nacl from 'https://esm.sh/tweetnacl@1.0.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { publicKey, signature, message } = await req.json()
    
    console.log('Verifying wallet signature for:', publicKey)
    
    // Validate inputs
    if (!publicKey || !signature || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Decode and verify signature
    const publicKeyBytes = base58.decode(publicKey)
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
    const messageBytes = new TextEncoder().encode(message)
    
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    )
    
    if (!verified) {
      console.log('Signature verification failed')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Signature verified successfully')
    
    // Create a custom JWT token with wallet_address claim
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Generate a session token (simplified - in production use proper JWT)
    const sessionToken = crypto.randomUUID()
    
    // Store verified session in a sessions table (you'd need to create this)
    // For now, return success with wallet address
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        wallet_address: publicKey,
        session_token: sessionToken,
        verified: true
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error verifying wallet:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
