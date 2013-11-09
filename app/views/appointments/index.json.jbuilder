json.array!(@appointments) do |appointment|
  json.extract! appointment, :year, :month, :day, :desciption, :time
  json.url appointment_url(appointment, format: :json)
end
