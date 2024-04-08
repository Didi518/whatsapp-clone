import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { api } from './_generated/api'

export const sendTextMessage = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Non autorisé')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique()

    if (!user) {
      throw new ConvexError('Utilisateur introuvable')
    }

    const conversation = await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('_id'), args.conversation))
      .first()

    if (!conversation) {
      throw new ConvexError('Conversation introuvable')
    }

    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError('Vous ne faîtes pas parti de la conversation')
    }

    await ctx.db.insert('messages', {
      sender: args.sender,
      content: args.content,
      conversation: args.conversation,
      messageType: 'text',
    })

    if (args.content.startsWith('@gpt')) {
      await ctx.scheduler.runAfter(0, api.openai.chat, {
        messageBody: args.content,
        conversation: args.conversation,
      })
    }
  },
})

export const sendChatGPTMessage = mutation({
  args: {
    content: v.string(),
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('messages', {
      content: args.content,
      sender: 'ChatGPT',
      messageType: 'text',
      conversation: args.conversation,
    })
  },
})

export const getMessages = query({
  args: {
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Non autorisé')
    }

    if (!args.conversation) return []

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversation', args.conversation)
      )
      .collect()

    const userProfileCache = new Map()

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        if (message.sender === 'ChatGPT') {
          return {
            ...message,
            sender: { name: 'ChatGPT', image: '/gpt.png' },
          }
        }

        let sender
        if (userProfileCache.has(message.sender)) {
          sender = userProfileCache.get(message.sender)
        } else {
          sender = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('_id'), message.sender))
            .first()

          userProfileCache.set(message.sender, sender)
        }

        return { ...message, sender }
      })
    )

    return messagesWithSender
  },
})

export const sendImage = mutation({
  args: {
    imgId: v.id('_storage'),
    sender: v.id('users'),
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Non autorisé')
    }

    const content = (await ctx.storage.getUrl(args.imgId)) as string

    await ctx.db.insert('messages', {
      content: content,
      sender: args.sender,
      messageType: 'image',
      conversation: args.conversation,
    })
  },
})

export const sendVideo = mutation({
  args: {
    videoId: v.id('_storage'),
    sender: v.id('users'),
    conversation: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Non autorisé')
    }

    const content = (await ctx.storage.getUrl(args.videoId)) as string

    await ctx.db.insert('messages', {
      content: content,
      sender: args.sender,
      messageType: 'video',
      conversation: args.conversation,
    })
  },
})
