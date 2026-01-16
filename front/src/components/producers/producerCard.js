import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ArrowRepeat, Pencil, Trash } from 'react-bootstrap-icons'
import useDefaultErrorHandler from '../../utils/useDefaultErrorHandler'
import { BackConfContext } from '../../context/backConfContext'
import { getOptConfirm, getOptOk, ModalContext } from '../modals/genericModalContext'
import axios from 'axios'

ProducerCard.prototype = {
  editMode: PropTypes.bool,
  hideEdit: PropTypes.bool,
  producer: PropTypes.object,
  propId: PropTypes.string,
  propName: PropTypes.string,
  displayFields: PropTypes.object,
  deleteUrl: PropTypes.func,
  deleteConfirmMsg: PropTypes.func,
  deleteMsg: PropTypes.func,
  refresh: PropTypes.func,
}

export function ProducerCard({
  editMode,
  hideEdit,
  producer,
  propId,
  propName,
  displayFields,
  deleteUrl,
  deleteConfirmMsg,
  deleteMsg,
  refresh,
}) {
  const { defaultErrorHandler } = useDefaultErrorHandler()

  const { backConf } = useContext(BackConfContext)
  const [back, setBack] = useState(backConf)
  useEffect(() => setBack(backConf), [backConf])

  const { changeOptions, toggle } = useContext(ModalContext)

  const getFormProducer = (producer, query) => back?.isLoaded && back.getConsole(producer, query)

  const [isEdit, setIsEdit] = useState(!!editMode)
  useEffect(() => setIsEdit(!!editMode), [editMode])

  const producerId = producer[propId]
  const producerName = producer[propName]

  const updatePortalOrganizationUrl = (suffix) => back?.isLoaded && back.getBackCatalog('portal/organizations', suffix)

  const updateOrganizationFromPortal = (id) => {
    axios
      .get(updatePortalOrganizationUrl(id))
      .then(() => refresh())
      .catch((err) => defaultErrorHandler(err))
  }

  /**
   * Call for organization deletion
   * @param {*} id Identifier of the object to delete
   */
  const deleteProducer = (id) => {
    axios
      .delete(deleteUrl(id))
      .then(() => {
        changeOptions(getOptOk(deleteMsg(id), () => refresh()))
        toggle()
      })
      .catch((err) => defaultErrorHandler(err))
  }

  /**
   * call for confirmation before organization deletion
   * @param {*} id Identifier of the organization to delete
   */
  const triggerDeleteProducer = (id) => {
    changeOptions(getOptConfirm(deleteConfirmMsg(producerName), () => deleteProducer(id)))
    toggle()
  }

  const displayEditionButton = (hideEdit) =>
    hideEdit ? (
      <button type={'button'} className={'btn primary-btn'} disabled={hideEdit}>
        <Pencil />
      </button>
    ) : (
      <a
        href={getFormProducer('organizations', `update=${producerId}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn primary-btn"
      >
        <Pencil />
      </a>
    )

  const displayValidationStatus = (organizationStatus) => {
    switch (organizationStatus) {
      case 'DRAFT':
        return displaySpan('rudi', 'En attente de validation')
      case 'IN_PROGRESS':
        return displaySpan('rudi', 'En attente de validation')
      case 'CANCELLED':
        return displaySpan('danger', 'Organisation refusée')
      case 'VALIDATED':
        return displaySpan('rudi', 'Organisation validée')
      case 'DISENGAGED':
        return displaySpan('muted', 'Organisation supprimée')
      default:
        return ''
    }
  }
  const displayAttachmentStatus = (attachmentStatus) => {
    switch (attachmentStatus) {
      case 'DRAFT':
        return displaySpan('rudi', 'En attente de rattachement')
      case 'IN_PROGRESS':
        return displaySpan('rudi', 'En attente de rattachement')
      case 'CANCELLED':
        return displaySpan('danger', 'Rattachement refusée')
      case 'VALIDATED':
        return displaySpan('rudi', 'Organisation rattachée')
      case 'DISENGAGED':
        return displaySpan('muted', 'Organisation détachée')
      default:
        return ''
    }
  }

  const displaySpan = (level, text) => (
    <span className={'status-pill text-bg-' + level} id="status-pill">
      {text}
    </span>
  )

  return (
    <div className="col-12" key={producerId}>
      <div className="card card-margin">
        <h5 className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <a>{producerName}</a>
            <span className={'align-pill-right '}>
              {producer['organization_status'] && displayValidationStatus(producer['organization_status'])}
              {producer['linked_producer_status'] && displayAttachmentStatus(producer['linked_producer_status'])}
            </span>
            {isEdit && (
              <div className="btn-group" role="group">
                <button
                  type={'button'}
                  className={'btn primary-btn'}
                  onClick={() => updateOrganizationFromPortal(producerId)}
                >
                  <ArrowRepeat />
                </button>
                {displayEditionButton(hideEdit)}
                <button
                  type={'button'}
                  className="btn btn-danger"
                  onClick={() => triggerDeleteProducer(producerId)}
                  disabled={hideEdit}
                >
                  <Trash />
                </button>
              </div>
            )}
          </div>
        </h5>
        <div className="card-body">
          {Object.keys(displayFields).map(
            (key) =>
              producer[key] && (
                <p className="card-text" key={`${producerId}.${key}`}>
                  {displayFields[key]}&nbsp;:&nbsp;
                  <small className="text-muted">
                    {!Array.isArray(producer[key]) ? producer[key] : JSON.stringify(producer[key])}
                  </small>
                </p>
              )
          )}
        </div>
      </div>
    </div>
  )
}
