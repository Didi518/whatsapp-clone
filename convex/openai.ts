import OpenAI from 'openai'
import { v } from 'convex/values'

import { api } from './_generated/api'
import { action } from './_generated/server'

const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey })

export const chat = action({
  args: {
    messageBody: v.string(),
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'you are a terse bot in a group chat responding to questions with 1-sentence response',
        },
        {
          role: 'user',
          content: args.messageBody,
        },
      ],
    })

    const messageContent = res.choices[0].message.content

    await ctx.runMutation(api.messages.sendChatGPTMessage, {
      content: messageContent ?? "Désolé, je n'ai pas compris votre demande.",
      conversation: args.conversation,
    })
  },
})
