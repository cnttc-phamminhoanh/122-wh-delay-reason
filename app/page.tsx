import { ReasonPage } from '@/components/reason-page'

export default function Page(props: PageProps<'/'>) {
  return <ReasonPage searchParams={props.searchParams} />
}
