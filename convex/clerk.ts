'use node'

import { v } from 'convex/values'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/clerk-sdk-node'

import { internalAction } from './_generated/server'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET as string

export const fulfill = internalAction({
  args: {
    headers: v.any(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const wh = new Webhook(WEBHOOK_SECRET)
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent
    return payload
  },
})
