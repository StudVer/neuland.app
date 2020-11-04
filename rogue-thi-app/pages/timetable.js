import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Container from 'react-bootstrap/Container'
import ListGroup from 'react-bootstrap/ListGroup'

import styles from '../styles/Timetable.module.css'

import { getTimetable } from '../lib/thi-api-client'
import { formatFriendlyDate, formatFriendlyTime } from '../lib/date-utils'

async function getFriendlyTimetable () {
  const today = new Date()

  const { timetable } = await getTimetable(localStorage.session, new Date())

  // get all available dates
  const dates = timetable
    .map(x => x.datum)
    .filter(x => new Date(x) > today)
    .filter((v, i, a) => a.indexOf(v) === i)

  // get events for each date
  const groups = dates.map(date => ({
    date: date,
    items: timetable
      .filter(x => x.datum === date)
      .map(x => {
        // parse dates
        x.start_date = new Date(`${x.datum} ${x.von}`)
        x.end_date = new Date(`${x.datum} ${x.bis}`)
        return x
      })
  }))

  return groups
}

export default function Timetable () {
  const router = useRouter()
  const [timetable, setTimetable] = useState(null)

  useEffect(() => {
    getFriendlyTimetable()
      .then(resp => setTimetable(resp))
      .catch(err => {
        console.error(err)
        router.push('/login')
      })
  }, [])

  return (
    <Container>
      {timetable && timetable.map((group, idx) =>
        <ListGroup key={idx}>
          <h4 className={styles.dateBoundary}>
            {formatFriendlyDate(group.date)}
          </h4>

          {group.items.map((item, idx) =>
            <ListGroup.Item key={idx} className={styles.item}>
              <div className={styles.left}>
                <div className={styles.name}>
                  {item.veranstaltung}
                </div>
                <div className={styles.room}>
                  {item.raum}
                </div>
              </div>
              <div className={styles.right}>
                {formatFriendlyTime(item.start_date)} <br />
                {formatFriendlyTime(item.end_date)}
              </div>
            </ListGroup.Item>
          )}
        </ListGroup>
      )}
    </Container>
  )
}