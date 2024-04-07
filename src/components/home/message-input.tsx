import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Laugh, Mic, Plus, Send } from 'lucide-react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

import { useConversationStore } from '@/store/chat-store'
import useComponentVisible from '@/hooks/useComponentVisible'

import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { api } from '../../../convex/_generated/api'
import toast from 'react-hot-toast'
import MediaDropdown from './media-dropdown'

const MessageInput = () => {
  const [msgText, setMsgText] = useState('')
  const sendTextMsg = useMutation(api.messages.sendTextMessage)

  const me = useQuery(api.users.getMe)
  const { selectedConversation } = useConversationStore()

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)

  const addEmoji = (e: any) => {
    const sym = e.unified.split('_')
    const codeArray = sym.map((el: any) => parseInt(el, 16))
    let emoji = String.fromCodePoint(...codeArray)
    setMsgText(msgText + emoji)
  }

  const handleSendTextMsg = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await sendTextMsg({
        content: msgText,
        conversation: selectedConversation!._id,
        sender: me!._id,
      })
      setMsgText('')
    } catch (error: any) {
      toast.error(error.message)
      console.error(error)
    }
  }

  return (
    <div className="bg-gray-primary p-2 flex gap-4 items-center">
      <div className="relative flex gap-2 ml-2">
        <div ref={ref} onClick={() => setIsComponentVisible(true)}>
          {isComponentVisible && (
            <div style={{ position: 'absolute', bottom: '40px', left: '0' }}>
              <Picker
                theme="dark"
                locale="fr"
                data={data}
                onEmojiSelect={addEmoji}
                style={{
                  position: 'relative',
                  bottom: '1.5rem',
                  left: '1rem',
                  zIndex: 50,
                }}
              />
            </div>
          )}
          <Laugh className="text-gray-600 dark:text-gray-400" />
        </div>
        <MediaDropdown />
      </div>
      <form onSubmit={handleSendTextMsg} className="w-full flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Tapez un message"
            className="py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
        </div>
        <div className="mr-4 flex items-center gap-3">
          {msgText.length > 0 ? (
            <Button
              type="submit"
              size={'sm'}
              className="bg-transparent text-foreground hover:bg-transparent"
            >
              <Send />
            </Button>
          ) : (
            <Button
              type="submit"
              size={'sm'}
              className="bg-transparent text-foreground hover:bg-transparent"
            >
              <Mic />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
export default MessageInput
