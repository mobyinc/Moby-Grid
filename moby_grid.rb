class MobyGrid < Sinatra::Base

  set public_folder: 'public', static: true

  get '/' do
    erb :home
  end
end
