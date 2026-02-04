import React from 'react'

const Feature = () => {
    return (
        <div className="min-h-screen bg-[#FAFAF8] px-6 py-16">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-10 text-center">
                    <span className="text-gray-900">MeetScribe </span>
                    <span className="text-orange-600">Features</span>
                </h1>
                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{f.title}</h3>
                            <p className="text-gray-600">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


const features = [
    { title: 'Live Transcription', desc: 'Real-time meeting transcription with speaker separation.' },
    { title: 'AI Summaries', desc: 'Automatically generated concise meeting summaries.' },
    { title: 'Action Items', desc: 'Detects and lists tasks with clear ownership.' },
    { title: 'Document Generation', desc: 'Creates professional MOMs and reports instantly.' },
    { title: 'Secure by Design', desc: 'Privacy-first and encrypted data handling.' }
]
  


export default Feature;