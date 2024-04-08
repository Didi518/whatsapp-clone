import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { useClerk } from '@clerk/nextjs'

import { randomID } from '@/lib/utils'

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split('?')[1]
  return new URLSearchParams(urlStr)
}

export default function VideoUIKit() {
  const roomID = getUrlParams().get('roomID') || randomID(5)
  const { user } = useClerk()

  let myMeeting = (element: HTMLDivElement) => {
    const initMeeting = async () => {
      const res = await fetch(`/api/zegocloud?userID=${user?.id}`)
      const { token, appID } = await res.json()

      const username =
        user?.fullName || user?.emailAddresses[0].emailAddress.split('@')[0]

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appID,
        token,
        roomID,
        user?.id!,
        username
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: 'Lien personnel',
            url:
              window.location.protocol +
              '//' +
              window.location.host +
              window.location.pathname +
              '?roomID=' +
              roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
      })
    }
    initMeeting()
  }

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  )
}
