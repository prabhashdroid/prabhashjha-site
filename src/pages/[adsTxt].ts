/* /ads.txt — Authorized Digital Sellers (IAB).
 *
 * This is a dynamic route with an empty getStaticPaths when unconfigured,
 * which is a deliberate choice: it means the file is simply ABSENT until a
 * real publisher ID exists.
 *
 * Shipping a placeholder would be actively harmful. The spec treats the file
 * as exhaustive — an ads.txt that exists but does not name a seller declares
 * that nobody is authorised to sell this inventory, so exchanges drop the
 * bids. No file at all is neutral; an empty file is a block.
 */
import { MONETISATION } from "../siteData";

export function getStaticPaths() {
  const body = (MONETISATION?.adsTxt ?? "").trim();
  return body ? [{ params: { adsTxt: "ads.txt" }, props: { body } }] : [];
}

export function GET({ props }: { props: { body: string } }) {
  return new Response(props.body.endsWith("\n") ? props.body : props.body + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
