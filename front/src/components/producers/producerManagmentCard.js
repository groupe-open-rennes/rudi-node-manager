import React, { useContext, useEffect, useState } from 'react'
import { BackConfContext } from '../../context/backConfContext'
import { Plus } from 'react-bootstrap-icons'

ProducerManagmentCard.propTypes = {

}

export function ProducerManagmentCard() {
  const objType = 'organizations'
  const { backConf } = useContext(BackConfContext)

  const [back, setBack] = useState(backConf)
  useEffect(() => setBack(backConf), [backConf])

  const getFormObj = (obj, query) => back?.isLoaded && back.getConsole(obj, query)

  return (
    <div className="col-12">
      <div className="card edit-card-margin">
        <div className="card-body">
          <div className="inline">
            <a href={getFormObj(objType)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Ajouter un producteur <Plus />
            </a>
            <a target="_blank" rel="noopener noreferrer" className="btn btn-secondary mx-3" href="/producer/attach">
              Rattacher un producteur <Plus />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}