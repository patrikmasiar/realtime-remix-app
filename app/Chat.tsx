import {useState} from "react";
import dayjs from "dayjs";

export default function Example({ messages, onSubmit }: {messages: any[], onSubmit: (message: string) => void}) {
  const [messageValue, setMessageValue] = useState('')

  return (
    <>
      <ul role="list" className="space-y-6">
        {messages.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <>
              <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                <div className="flex justify-between gap-x-4">
                  <div className="py-0.5 text-xs leading-5 text-gray-500">
                    <span className="font-medium text-gray-900">{activityItem.author_name}</span>
                  </div>
                  <time dateTime={activityItem.created_at} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                    {dayjs(activityItem.created_at).format('H:mm, MMMM D, YYYY')}
                  </time>
                </div>
                <p className="text-sm leading-6 text-gray-500">{activityItem.text}</p>
              </div>
            </>
          </li>
        ))}
      </ul>

      {/* New comment form */}
      <div className="mt-6 flex gap-x-3">
        <div className="relative flex-auto">
          <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
            <textarea
              rows={2}
              name="comment"
              id="comment"
              className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              value={messageValue}
              onChange={e => setMessageValue(e.target.value)}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
            <button
              type="submit"
              onClick={() => {
                onSubmit(messageValue)
                setMessageValue('')
              }}
              disabled={messageValue.length === 0}
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
