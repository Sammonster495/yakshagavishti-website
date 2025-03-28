import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "~/components/ui/accordion"
import Reveal from "../Animations/reveal"
import Link from "next/link"

const faqs = [
  {
    q: "Is Yakshagavishti open for all teams?",
    ans: <div className="">No, unfortunately this is for invited colleges only.</div>
  },
  {
    q: "When will Yakshagavishti be conducted?",
    ans: <div className="">Yakshagavishti will be on Saturday, April 12th, 2025</div>
  },
  {
    q: "Do we have to physically register again on the day of competition?",
    ans: <div className="">No; teams only need to verify their registrations.</div>
  },
  {
    q: "Where & how can I access the rule book and Prasanga Padya list?",
    ans: <div className="">It can be downloaded directly from the website <Link href='#about' className="text-secondary-100">here</Link></div>
  },
  {
    q: "Can anyone attend Yakshagavishti as an audience member?",
    ans: <div className="">Yes. Anyone can be an audience member; you're most welcome for the event!</div>
  },
]

const Faq = () => {
  return (
    <Accordion type="single" collapsible className="w-full  text-base md:text-lg xl:text-xl">
      <Reveal classes="">
        <p className="font-rhomdon text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl text-center md:text-left">FAQ</p>
      </Reveal>
      {faqs.map((faq, idx) => {
        return (
          <AccordionItem value={`item-${idx+1}`} key={idx}>
            <AccordionTrigger className="py-3 sm:py-4 text-left">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-base md:text-lg xl:text-xl text-gray-400">
              {faq.ans}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default Faq