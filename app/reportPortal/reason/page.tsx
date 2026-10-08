import { ReasonPage } from '@/components/reason-page'

export default function Page(props: PageProps<'/reportPortal/reason'>) {
  return <ReasonPage searchParams={props.searchParams} />
}
