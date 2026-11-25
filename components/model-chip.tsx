'use client'

import { useRef } from 'react'
import { MODEL_INFO as M } from '@/lib/model'

// The model's name and tag, always visible, with the full details one tap away.
export default function ModelChip() {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button className="model-chip" type="button" onClick={() => ref.current?.showModal()} aria-label={`Model: ${M.name}. Show details`}>
        <span className="tag">{M.tag}</span>
        <span className="more">Details</span>
      </button>
      <dialog ref={ref} aria-labelledby="modelTitle" onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="sheet">
          <div className="row between">
            <h2 id="modelTitle">The model</h2>
            <button className="icon-btn plain" type="button" aria-label="Close" onClick={() => ref.current?.close()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <dl className="specs">
            <dt>Model</dt>
            <dd>{M.name}</dd>
            <dt>Tag</dt>
            <dd className="mono">{M.tag}</dd>
            <dt>Made by</dt>
            <dd>{M.maker}</dd>
            <dt>Parameters</dt>
            <dd>{M.parameters}</dd>
            <dt>Quantization</dt>
            <dd>{M.quantization}</dd>
            <dt>Context</dt>
            <dd>{M.context}</dd>
            <dt>Memory</dt>
            <dd>{M.memory}</dd>
            <dt>License</dt>
            <dd>{M.license}</dd>
            <dt>Runs with</dt>
            <dd>{M.runtime}</dd>
          </dl>
          <p className="note">
            It is a very small model, so it will get things wrong. Grove is an experiment in how well a model this size works on a device.{' '}
            <a href={M.source} target="_blank" rel="noopener">
              See the files
            </a>
          </p>
        </div>
      </dialog>
    </>
  )
}
