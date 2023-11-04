import {Form} from "@remix-run/react";

const activity = [
  {
    id: 4,
    person: {
      name: 'Chelsea Hagon',
    },
    comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
    dateTime: '2023-01-23T15:56',
  },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <>
      <ul role="list" className="space-y-6">
        {activity.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <div
              className={classNames(
                activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                'absolute left-0 top-0 flex w-6 justify-center'
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            <>
              <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                <span className="font-medium text-gray-900">{activityItem.person.name}</span>
              </p>
              <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                {activityItem.dateTime}
              </time>
            </>
          </li>
        ))}
      </ul>

      {/* New comment form */}
      <div className="mt-6 flex gap-x-3">
        <Form action="#" className="relative flex-auto">
          <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
            <textarea
              rows={2}
              name="comment"
              id="comment"
              className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              defaultValue={''}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
            <button
              type="submit"
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Comment
            </button>
          </div>
        </Form>
      </div>
    </>
  )
}
