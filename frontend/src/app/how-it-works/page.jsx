import React from 'react'

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-[#FAFAF8] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl text-center font-bold mb-10 text-gray-900">How It <span className='text-orange-600'>Works</span></h1>


                <div className="space-y-6">
                    {steps.map((s, i) => (
                        <div key={i} className="flex gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-orange-600 font-bold text-xl">{i + 1}</span>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{s.title}</h3>
                                <p className="text-gray-600">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
const steps = [
    { title: 'Join a Meeting', desc: 'MeetScribe starts listening once the meeting begins.' },
    { title: 'Live Transcription', desc: 'Speech is converted into accurate text in real time.' },
    { title: 'AI Analysis', desc: 'Key points, decisions, and tasks are identified.' },
    { title: 'Generate Outputs', desc: 'Summaries, action items, and documents are created.' },
    { title: 'Share & Export', desc: 'Download or share instantly with your team.' }
]

export default HowItWorks;